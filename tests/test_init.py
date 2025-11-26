"""Tests for Statistics Orphan Finder integration setup and HTTP view."""
from __future__ import annotations

import json
from unittest.mock import AsyncMock, MagicMock, Mock, patch
from pathlib import Path

import pytest
from aiohttp import web
from homeassistant.core import HomeAssistant

from custom_components.statistics_orphan_finder import (
    async_setup,
    async_setup_entry,
    async_unload_entry,
    StatisticsOrphanView,
)
from custom_components.statistics_orphan_finder.const import DOMAIN


class TestSetup:
    """Test integration setup functions."""

    @pytest.mark.asyncio
    async def test_async_setup(self, mock_hass: MagicMock):
        """Test async_setup initializes hass.data."""
        mock_hass.data = {}
        result = await async_setup(mock_hass, {})

        assert result is True
        assert DOMAIN in mock_hass.data

    @pytest.mark.asyncio
    async def test_async_setup_entry_creates_coordinator(
        self, mock_hass: MagicMock, mock_config_entry: MagicMock
    ):
        """Test async_setup_entry creates coordinator and registers view (skip file ops)."""
        mock_hass.data = {DOMAIN: {}}

        # Mock integration version
        mock_integration = AsyncMock()
        mock_integration.version = "2.0.0-test"

        # Mock async_add_executor_job to skip file operations
        mock_hass.async_add_executor_job = AsyncMock(return_value=True)

        with patch("homeassistant.loader.async_get_integration", return_value=mock_integration):
            with patch("custom_components.statistics_orphan_finder.Path") as mock_path:
                # Mock Path to return file that exists
                mock_js_file = MagicMock()
                mock_js_file.exists.return_value = True
                mock_js_file.stat.return_value.st_mtime = 1234567890
                mock_path.return_value.__truediv__.return_value = mock_js_file

                with patch("custom_components.statistics_orphan_finder.frontend"):
                    result = await async_setup_entry(mock_hass, mock_config_entry)

        assert result is True
        assert mock_config_entry.entry_id in mock_hass.data[DOMAIN]
        assert "coordinator" in mock_hass.data[DOMAIN][mock_config_entry.entry_id]
        assert "view" in mock_hass.data[DOMAIN][mock_config_entry.entry_id]
        mock_hass.http.register_view.assert_called_once()

    @pytest.mark.asyncio
    async def test_async_unload_entry_calls_shutdown(
        self, mock_hass: MagicMock, mock_config_entry: MagicMock
    ):
        """Test async_unload_entry shuts down coordinator."""
        mock_hass.data = {}

        # Setup mock coordinator and view
        mock_coordinator = MagicMock()
        mock_coordinator.async_shutdown = AsyncMock()
        mock_view = MagicMock()
        mock_view.url = "/api/test"
        mock_view.name = "test"

        mock_hass.data[DOMAIN] = {
            mock_config_entry.entry_id: {
                "coordinator": mock_coordinator,
                "view": mock_view,
            }
        }

        # Mock router with empty routes
        mock_hass.http.app.router.routes.return_value = []

        with patch("custom_components.statistics_orphan_finder.frontend"):
            result = await async_unload_entry(mock_hass, mock_config_entry)

        assert result is True
        mock_coordinator.async_shutdown.assert_called_once()
        assert mock_config_entry.entry_id not in mock_hass.data[DOMAIN]


class TestStatisticsOrphanView:
    """Test StatisticsOrphanView HTTP handling."""

    def test_view_initialization(self, mock_hass: MagicMock):
        """Test view initializes with correct attributes."""
        view = StatisticsOrphanView(mock_hass, "test_entry_id")

        assert view.hass is mock_hass
        assert view.entry_id == "test_entry_id"
        assert view.url == "/api/statistics_orphan_finder"
        assert view.name == "api:statistics_orphan_finder"
        assert view.requires_auth is True

    def test_get_coordinator_returns_coordinator(self, mock_hass: MagicMock):
        """Test _get_coordinator retrieves coordinator from hass.data."""
        mock_coordinator = MagicMock()
        mock_hass.data = {
            DOMAIN: {
                "test_entry": {"coordinator": mock_coordinator}
            }
        }

        view = StatisticsOrphanView(mock_hass, "test_entry")
        coordinator = view._get_coordinator()

        assert coordinator is mock_coordinator

    def test_get_coordinator_returns_none_when_missing(self, mock_hass: MagicMock):
        """Test _get_coordinator returns None when coordinator not found."""
        mock_hass.data = {DOMAIN: {}}

        view = StatisticsOrphanView(mock_hass, "nonexistent_entry")
        coordinator = view._get_coordinator()

        assert coordinator is None

    @pytest.mark.asyncio
    async def test_get_database_size_action(self, mock_hass: MagicMock):
        """Test GET request with database_size action."""
        mock_coordinator = MagicMock()
        mock_coordinator._is_shutting_down = False
        mock_coordinator.async_get_database_size = AsyncMock(
            return_value={"states": 1000, "statistics": 500}
        )

        mock_hass.data = {
            DOMAIN: {"test_entry": {"coordinator": mock_coordinator}}
        }

        view = StatisticsOrphanView(mock_hass, "test_entry")

        mock_request = MagicMock()
        mock_request.query = {"action": "database_size"}

        response = await view.get(mock_request)

        assert isinstance(response, web.Response)
        assert response.status == 200
        mock_coordinator.async_get_database_size.assert_called_once()

    @pytest.mark.asyncio
    async def test_get_overview_step_0(self, mock_hass: MagicMock):
        """Test GET request with entity_storage_overview_step action (step 0)."""
        mock_coordinator = MagicMock()
        mock_coordinator._is_shutting_down = False
        mock_coordinator.async_execute_overview_step = AsyncMock(
            return_value={"status": "initialized", "session_id": "test-session"}
        )

        mock_hass.data = {
            DOMAIN: {"test_entry": {"coordinator": mock_coordinator}}
        }

        view = StatisticsOrphanView(mock_hass, "test_entry")

        mock_request = MagicMock()
        mock_request.query = {"action": "entity_storage_overview_step", "step": "0"}

        response = await view.get(mock_request)

        assert response.status == 200
        mock_coordinator.async_execute_overview_step.assert_called_once_with(0, None)

    @pytest.mark.asyncio
    async def test_get_overview_step_requires_session_id(self, mock_hass: MagicMock):
        """Test that steps 1-8 require session_id parameter."""
        mock_coordinator = MagicMock()
        mock_coordinator._is_shutting_down = False

        mock_hass.data = {
            DOMAIN: {"test_entry": {"coordinator": mock_coordinator}}
        }

        view = StatisticsOrphanView(mock_hass, "test_entry")

        mock_request = MagicMock()
        mock_request.query = {"action": "entity_storage_overview_step", "step": "1"}

        response = await view.get(mock_request)

        assert response.status == 400
        # Should return error about missing session_id

    @pytest.mark.asyncio
    async def test_generate_delete_sql_action(self, mock_hass: MagicMock):
        """Test GET request with generate_delete_sql action."""
        mock_coordinator = MagicMock()
        mock_coordinator._is_shutting_down = False
        mock_coordinator.generate_delete_sql = Mock(return_value="DELETE FROM states WHERE...")
        mock_coordinator._calculate_entity_storage = Mock(return_value=50000)

        mock_hass.data = {
            DOMAIN: {"test_entry": {"coordinator": mock_coordinator}}
        }

        view = StatisticsOrphanView(mock_hass, "test_entry")

        mock_request = MagicMock()
        mock_request.query = {
            "action": "generate_delete_sql",
            "entity_id": "sensor.test",
            "origin": "States",
            "in_states_meta": "true",
            "in_statistics_meta": "false",
        }

        response = await view.get(mock_request)

        assert response.status == 200
        mock_coordinator.generate_delete_sql.assert_called_once()
        mock_coordinator._calculate_entity_storage.assert_called_once()

    @pytest.mark.asyncio
    async def test_invalid_action_returns_400(self, mock_hass: MagicMock):
        """Test that invalid action returns 400 error."""
        mock_coordinator = MagicMock()
        mock_coordinator._is_shutting_down = False

        mock_hass.data = {
            DOMAIN: {"test_entry": {"coordinator": mock_coordinator}}
        }

        view = StatisticsOrphanView(mock_hass, "test_entry")

        mock_request = MagicMock()
        mock_request.query = {"action": "invalid_action"}

        response = await view.get(mock_request)

        assert response.status == 400

    @pytest.mark.asyncio
    async def test_missing_coordinator_returns_503(self, mock_hass: MagicMock):
        """Test that missing coordinator returns 503 error."""
        mock_hass.data = {DOMAIN: {}}

        view = StatisticsOrphanView(mock_hass, "nonexistent_entry")

        mock_request = MagicMock()
        mock_request.query = {"action": "database_size"}

        response = await view.get(mock_request)

        assert response.status == 503

    @pytest.mark.asyncio
    async def test_shutting_down_coordinator_returns_503(self, mock_hass: MagicMock):
        """Test that requests during shutdown return 503."""
        mock_coordinator = MagicMock()
        mock_coordinator._is_shutting_down = True

        mock_hass.data = {
            DOMAIN: {"test_entry": {"coordinator": mock_coordinator}}
        }

        view = StatisticsOrphanView(mock_hass, "test_entry")

        mock_request = MagicMock()
        mock_request.query = {"action": "database_size"}

        response = await view.get(mock_request)

        assert response.status == 503

    @pytest.mark.asyncio
    async def test_generate_sql_validates_entity_id_format(self, mock_hass: MagicMock):
        """Test that generate_delete_sql validates entity_id format."""
        mock_coordinator = MagicMock()
        mock_coordinator._is_shutting_down = False

        mock_hass.data = {
            DOMAIN: {"test_entry": {"coordinator": mock_coordinator}}
        }

        view = StatisticsOrphanView(mock_hass, "test_entry")

        mock_request = MagicMock()
        mock_request.query = {
            "action": "generate_delete_sql",
            "entity_id": "invalid_format",  # Missing dot
            "origin": "States",
        }

        response = await view.get(mock_request)

        assert response.status == 400

    @pytest.mark.asyncio
    async def test_generate_sql_validates_origin(self, mock_hass: MagicMock):
        """Test that generate_delete_sql validates origin value."""
        mock_coordinator = MagicMock()
        mock_coordinator._is_shutting_down = False

        mock_hass.data = {
            DOMAIN: {"test_entry": {"coordinator": mock_coordinator}}
        }

        view = StatisticsOrphanView(mock_hass, "test_entry")

        mock_request = MagicMock()
        mock_request.query = {
            "action": "generate_delete_sql",
            "entity_id": "sensor.test",
            "origin": "InvalidOrigin",  # Invalid origin
        }

        response = await view.get(mock_request)

        assert response.status == 400

    @pytest.mark.asyncio
    async def test_get_overview_step_missing_step_param(self, mock_hass: MagicMock):
        """Missing step parameter should return 400."""
        mock_coordinator = MagicMock()
        mock_coordinator._is_shutting_down = False
        mock_hass.data = {DOMAIN: {"test_entry": {"coordinator": mock_coordinator}}}

        view = StatisticsOrphanView(mock_hass, "test_entry")
        mock_request = MagicMock()
        mock_request.query = {"action": "entity_storage_overview_step"}

        response = await view.get(mock_request)

        assert response.status == 400

    @pytest.mark.asyncio
    async def test_overview_step_generic_exception(self, mock_hass: MagicMock):
        """Unexpected errors in overview step are returned as 500."""
        mock_coordinator = MagicMock()
        mock_coordinator._is_shutting_down = False
        mock_coordinator.async_execute_overview_step = AsyncMock(side_effect=RuntimeError("boom"))
        mock_hass.data = {DOMAIN: {"test_entry": {"coordinator": mock_coordinator}}}

        view = StatisticsOrphanView(mock_hass, "test_entry")
        mock_request = MagicMock()
        mock_request.query = {"action": "entity_storage_overview_step", "step": "1", "session_id": "abc"}

        response = await view.get(mock_request)

        assert response.status == 500


class TestMessageHistogramEndpoint:
    """Tests for the entity_message_histogram HTTP endpoint."""

    @pytest.mark.asyncio
    async def test_get_entity_message_histogram_success(
        self, mock_hass: MagicMock, mock_config_entry: MagicMock
    ):
        """Valid request should delegate to coordinator and return payload."""
        mock_coordinator = MagicMock()
        mock_coordinator._is_shutting_down = False
        mock_coordinator.async_get_message_histogram = AsyncMock(
            return_value={"hourly_counts": [0] * 24, "total_messages": 0, "time_range_hours": 24}
        )

        mock_hass.data = {DOMAIN: {mock_config_entry.entry_id: {"coordinator": mock_coordinator}}}
        view = StatisticsOrphanView(mock_hass, mock_config_entry.entry_id)

        mock_request = MagicMock()
        mock_request.query = {
            "action": "entity_message_histogram",
            "entity_id": "sensor.test",
            "hours": "24",
        }

        response = await view.get(mock_request)

        assert response.status == 200
        payload = json.loads(response.text or response.body.decode())
        assert payload["hourly_counts"] == [0] * 24
        assert payload["time_range_hours"] == 24
        mock_coordinator.async_get_message_histogram.assert_awaited_once_with("sensor.test", 24)

    @pytest.mark.asyncio
    async def test_get_entity_message_histogram_invalid_entity_id(
        self, mock_hass: MagicMock, mock_config_entry: MagicMock
    ):
        """Invalid entity_id should return 400."""
        mock_coordinator = MagicMock()
        mock_coordinator._is_shutting_down = False
        mock_hass.data = {DOMAIN: {mock_config_entry.entry_id: {"coordinator": mock_coordinator}}}

        view = StatisticsOrphanView(mock_hass, mock_config_entry.entry_id)

        mock_request = MagicMock()
        mock_request.query = {"action": "entity_message_histogram", "entity_id": "invalid", "hours": "24"}

        response = await view.get(mock_request)

        assert response.status == 400

    @pytest.mark.asyncio
    async def test_get_entity_message_histogram_invalid_hours(
        self, mock_hass: MagicMock, mock_config_entry: MagicMock
    ):
        """Hours not in allowed set should return 400."""
        mock_coordinator = MagicMock()
        mock_coordinator._is_shutting_down = False
        mock_hass.data = {DOMAIN: {mock_config_entry.entry_id: {"coordinator": mock_coordinator}}}

        view = StatisticsOrphanView(mock_hass, mock_config_entry.entry_id)

        mock_request = MagicMock()
        mock_request.query = {
            "action": "entity_message_histogram",
            "entity_id": "sensor.test",
            "hours": "12",
        }

        response = await view.get(mock_request)

        assert response.status == 400
        payload = json.loads(response.text or response.body.decode())
        assert "hours must be 24, 48, or 168" in payload["error"]

    @pytest.mark.asyncio
    async def test_get_entity_message_histogram_exception(
        self, mock_hass: MagicMock, mock_config_entry: MagicMock
    ):
        """Unhandled errors should return 500."""
        mock_coordinator = MagicMock()
        mock_coordinator._is_shutting_down = False
        mock_coordinator.async_get_message_histogram = AsyncMock(side_effect=RuntimeError("boom"))
        mock_hass.data = {DOMAIN: {mock_config_entry.entry_id: {"coordinator": mock_coordinator}}}

        view = StatisticsOrphanView(mock_hass, mock_config_entry.entry_id)
        mock_request = MagicMock()
        mock_request.query = {
            "action": "entity_message_histogram",
            "entity_id": "sensor.test",
            "hours": "24",
        }

        response = await view.get(mock_request)

        assert response.status == 500


class TestGenerateDeleteSQLEndpoint:
    """Tests for the generate_delete_sql HTTP endpoint."""

    @pytest.mark.asyncio
    @pytest.mark.parametrize(
        "origin,in_states_meta,in_statistics_meta",
        [
            ("States", "true", "false"),
            ("Short-term", "false", "true"),
            ("Long-term", "false", "true"),
            ("Both", "false", "true"),
            ("States+Statistics", "true", "true"),
        ],
    )
    async def test_generate_delete_sql_all_combinations(
        self,
        origin: str,
        in_states_meta: str,
        in_statistics_meta: str,
        mock_hass: MagicMock,
        mock_config_entry: MagicMock,
    ):
        """All origin combinations return SQL and storage estimation."""
        mock_coordinator = MagicMock()
        mock_coordinator._is_shutting_down = False
        mock_coordinator.generate_delete_sql = Mock(return_value="DELETE ...;")
        mock_coordinator._calculate_entity_storage = Mock(return_value=1234)

        mock_hass.data = {DOMAIN: {mock_config_entry.entry_id: {"coordinator": mock_coordinator}}}
        view = StatisticsOrphanView(mock_hass, mock_config_entry.entry_id)

        mock_request = MagicMock()
        mock_request.query = {
            "action": "generate_delete_sql",
            "entity_id": "sensor.test",
            "origin": origin,
            "in_states_meta": in_states_meta,
            "in_statistics_meta": in_statistics_meta,
        }

        response = await view.get(mock_request)

        assert response.status == 200
        payload = json.loads(response.text or response.body.decode())
        assert "sql" in payload
        assert payload["storage_saved"] == 1234
        mock_coordinator.generate_delete_sql.assert_called_once()
        mock_coordinator._calculate_entity_storage.assert_called_once()

    @pytest.mark.asyncio
    async def test_generate_delete_sql_missing_parameters(
        self, mock_hass: MagicMock, mock_config_entry: MagicMock
    ):
        """Missing origin or entity_id should return 400."""
        mock_coordinator = MagicMock()
        mock_coordinator._is_shutting_down = False
        mock_hass.data = {DOMAIN: {mock_config_entry.entry_id: {"coordinator": mock_coordinator}}}
        view = StatisticsOrphanView(mock_hass, mock_config_entry.entry_id)

        mock_request = MagicMock()
        mock_request.query = {"action": "generate_delete_sql", "origin": "States"}

        response = await view.get(mock_request)

        assert response.status == 400

    @pytest.mark.asyncio
    async def test_generate_delete_sql_value_error(
        self, mock_hass: MagicMock, mock_config_entry: MagicMock
    ):
        """ValueError from generator returns 400."""
        mock_coordinator = MagicMock()
        mock_coordinator._is_shutting_down = False
        mock_coordinator.generate_delete_sql = Mock(side_effect=ValueError("bad"))
        mock_coordinator._calculate_entity_storage = Mock(return_value=0)

        mock_hass.data = {DOMAIN: {mock_config_entry.entry_id: {"coordinator": mock_coordinator}}}
        view = StatisticsOrphanView(mock_hass, mock_config_entry.entry_id)

        mock_request = MagicMock()
        mock_request.query = {
            "action": "generate_delete_sql",
            "entity_id": "sensor.test",
            "origin": "States",
        }

        response = await view.get(mock_request)

        assert response.status == 400

    @pytest.mark.asyncio
    async def test_generate_delete_sql_generic_exception(
        self, mock_hass: MagicMock, mock_config_entry: MagicMock
    ):
        """Unexpected errors should return 500."""
        mock_coordinator = MagicMock()
        mock_coordinator._is_shutting_down = False
        mock_coordinator.generate_delete_sql = Mock(side_effect=RuntimeError("boom"))
        mock_coordinator._calculate_entity_storage = Mock(return_value=0)

        mock_hass.data = {DOMAIN: {mock_config_entry.entry_id: {"coordinator": mock_coordinator}}}
        view = StatisticsOrphanView(mock_hass, mock_config_entry.entry_id)

        mock_request = MagicMock()
        mock_request.query = {
            "action": "generate_delete_sql",
            "entity_id": "sensor.test",
            "origin": "States",
        }

        response = await view.get(mock_request)

        assert response.status == 500


class TestOverviewStepsEndpoint:
    """Tests for the entity_storage_overview_step HTTP endpoint."""

    @pytest.mark.asyncio
    @pytest.mark.parametrize("step", range(9))
    async def test_execute_overview_step_all_steps(
        self, step: int, mock_hass: MagicMock, mock_config_entry: MagicMock
    ):
        """Valid steps should delegate to coordinator."""
        mock_coordinator = MagicMock()
        mock_coordinator._is_shutting_down = False
        mock_coordinator.async_execute_overview_step = AsyncMock(return_value={"status": "ok", "step": step})

        mock_hass.data = {DOMAIN: {mock_config_entry.entry_id: {"coordinator": mock_coordinator}}}
        view = StatisticsOrphanView(mock_hass, mock_config_entry.entry_id)

        session_part = {} if step == 0 else {"session_id": "session-123"}

        mock_request = MagicMock()
        mock_request.query = {"action": "entity_storage_overview_step", "step": str(step), **session_part}

        response = await view.get(mock_request)

        assert response.status == 200
        payload = json.loads(response.text or response.body.decode())
        assert payload["step"] == step
        if step == 0:
            mock_coordinator.async_execute_overview_step.assert_awaited_once_with(step, None)
        else:
            mock_coordinator.async_execute_overview_step.assert_awaited_once_with(step, "session-123")

    @pytest.mark.asyncio
    async def test_execute_overview_step_invalid_step(
        self, mock_hass: MagicMock, mock_config_entry: MagicMock
    ):
        """Out of range step should return 400."""
        mock_coordinator = MagicMock()
        mock_coordinator._is_shutting_down = False
        mock_hass.data = {DOMAIN: {mock_config_entry.entry_id: {"coordinator": mock_coordinator}}}
        view = StatisticsOrphanView(mock_hass, mock_config_entry.entry_id)

        mock_request = MagicMock()
        mock_request.query = {"action": "entity_storage_overview_step", "step": "9", "session_id": "abc"}

        response = await view.get(mock_request)

        assert response.status == 400

    @pytest.mark.asyncio
    async def test_execute_overview_step_missing_session_id(
        self, mock_hass: MagicMock, mock_config_entry: MagicMock
    ):
        """Steps 1-8 without session_id should return 400."""
        mock_coordinator = MagicMock()
        mock_coordinator._is_shutting_down = False
        mock_hass.data = {DOMAIN: {mock_config_entry.entry_id: {"coordinator": mock_coordinator}}}
        view = StatisticsOrphanView(mock_hass, mock_config_entry.entry_id)

        mock_request = MagicMock()
        mock_request.query = {"action": "entity_storage_overview_step", "step": "2"}

        response = await view.get(mock_request)

        assert response.status == 400


class TestSetupCopyAndUnload:
    """Tests for frontend copy and unload cleanup paths."""

    @pytest.mark.asyncio
    async def test_async_setup_entry_copies_frontend_files(
        self, mock_config_entry: MagicMock, tmp_path
    ):
        """Ensure copy_frontend_file runs and copies artifacts."""
        hass = MagicMock(spec=HomeAssistant)
        hass.data = {DOMAIN: {}}
        hass.http = MagicMock()
        hass.http.register_view = MagicMock()
        hass.config = MagicMock()
        hass.config.path = MagicMock(side_effect=lambda p: str(tmp_path / p))
        hass.bus = MagicMock()
        hass.bus.async_fire = MagicMock()
        # Execute job immediately
        hass.async_add_executor_job = AsyncMock(side_effect=lambda func: func())

        mock_integration = AsyncMock()
        mock_integration.version = "1.0.0"

        with patch("homeassistant.loader.async_get_integration", return_value=mock_integration):
            await async_setup_entry(hass, mock_config_entry)

        target_dir = tmp_path / "www/community/statistics_orphan_finder"
        assert (target_dir / "statistics-orphan-panel.js").exists()
        assert (target_dir / "statistics-orphan-panel.js.map").exists()
        assert (target_dir / "chunks").is_dir()

    @pytest.mark.asyncio
    async def test_async_unload_entry_removes_routes(
        self, mock_config_entry: MagicMock
    ):
        """Route cleanup removes matching routes and handles logging."""
        hass = MagicMock(spec=HomeAssistant)
        hass.data = {
            DOMAIN: {
                mock_config_entry.entry_id: {
                    "coordinator": AsyncMock(),
                    "view": MagicMock(url="/api/statistics_orphan_finder", name="api:statistics_orphan_finder"),
                }
            }
        }
        # Mock routes with matching resource._path
        route = MagicMock()
        route.resource._path = "/api/statistics_orphan_finder"
        hass.http.app.router.routes.return_value = [route]

        hass.async_add_executor_job = AsyncMock()

        with patch("custom_components.statistics_orphan_finder.frontend"):
            result = await async_unload_entry(hass, mock_config_entry)

        assert result is True
        hass.http.app.router._resources.remove.assert_called_once_with(route.resource)
