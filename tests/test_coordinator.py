"""Tests for StatisticsOrphanCoordinator."""
from __future__ import annotations

from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from sqlalchemy.engine import Engine

from custom_components.statistics_orphan_finder.coordinator import (
    StatisticsOrphanCoordinator,
)


class TestStatisticsOrphanCoordinator:
    """Test StatisticsOrphanCoordinator class."""

    def test_coordinator_initialization(
        self, mock_hass: MagicMock, mock_config_entry: MagicMock
    ):
        """Test coordinator initializes correctly."""
        coordinator = StatisticsOrphanCoordinator(mock_hass, mock_config_entry)

        assert coordinator.hass is mock_hass
        assert coordinator.entry is mock_config_entry
        assert coordinator.db_service is not None
        assert coordinator.storage_calculator is not None
        assert coordinator.sql_generator is not None
        assert coordinator._step_data is None

    def test_get_engine(
        self, mock_hass: MagicMock, mock_config_entry: MagicMock
    ):
        """Test _get_engine delegates to db_service."""
        coordinator = StatisticsOrphanCoordinator(mock_hass, mock_config_entry)

        with patch.object(coordinator.db_service, "get_engine") as mock_get:
            mock_engine = MagicMock()
            mock_get.return_value = mock_engine

            engine = coordinator._get_engine()

            assert engine is mock_engine
            mock_get.assert_called_once()

    @pytest.mark.asyncio
    async def test_async_get_database_size(
        self, mock_hass: MagicMock, mock_config_entry: MagicMock
    ):
        """Test async_get_database_size delegates to db_service."""
        coordinator = StatisticsOrphanCoordinator(mock_hass, mock_config_entry)

        expected_result = {
            "states": 1000,
            "statistics": 500,
            "states_size": 50000,
            "statistics_size": 25000,
        }

        with patch.object(coordinator.db_service, "async_get_database_size") as mock_size:
            mock_size.return_value = expected_result

            result = await coordinator.async_get_database_size()

            assert result == expected_result
            mock_size.assert_called_once()


class TestCoordinatorStepProcessing:
    """Test coordinator step-by-step processing."""

    def test_init_step_data(
        self, mock_hass: MagicMock, mock_config_entry: MagicMock
    ):
        """Test _init_step_data initializes data structures."""
        coordinator = StatisticsOrphanCoordinator(mock_hass, mock_config_entry)

        result = coordinator._init_step_data()

        assert result["status"] == "initialized"
        assert result["total_steps"] == 8
        assert coordinator._step_data is not None
        assert "entity_map" in coordinator._step_data
        assert "current_step" in coordinator._step_data

    def test_fetch_step_1_states_meta(
        self, mock_hass: MagicMock, mock_config_entry: MagicMock, populated_sqlite_engine: Engine
    ):
        """Test step 1 fetches states_meta entities."""
        coordinator = StatisticsOrphanCoordinator(mock_hass, mock_config_entry)
        coordinator.db_service._engine = populated_sqlite_engine

        # Initialize step data
        coordinator._init_step_data()

        # Execute step 1
        result = coordinator._fetch_step_1_states_meta()

        assert result["status"] == "complete"
        assert result["entities_found"] == 4  # 4 entities in states_meta
        assert coordinator._step_data["entity_map"]["sensor.temperature"]["in_states_meta"] is True

    def test_fetch_step_2_states(
        self, mock_hass: MagicMock, mock_config_entry: MagicMock, populated_sqlite_engine: Engine
    ):
        """Test step 2 fetches states with counts."""
        coordinator = StatisticsOrphanCoordinator(mock_hass, mock_config_entry)
        coordinator.db_service._engine = populated_sqlite_engine

        coordinator._init_step_data()
        result = coordinator._fetch_step_2_states()

        assert result["status"] == "complete"
        assert result["entities_found"] > 0
        # sensor.temperature has 2 states
        assert coordinator._step_data["entity_map"]["sensor.temperature"]["in_states"] is True
        assert coordinator._step_data["entity_map"]["sensor.temperature"]["states_count"] == 2

    def test_fetch_step_3_statistics_meta(
        self, mock_hass: MagicMock, mock_config_entry: MagicMock, populated_sqlite_engine: Engine
    ):
        """Test step 3 fetches statistics_meta with metadata_id."""
        coordinator = StatisticsOrphanCoordinator(mock_hass, mock_config_entry)
        coordinator.db_service._engine = populated_sqlite_engine

        coordinator._init_step_data()
        result = coordinator._fetch_step_3_statistics_meta()

        assert result["status"] == "complete"
        assert result["entities_found"] == 3  # 3 entities in statistics_meta
        # Check metadata_id was stored
        assert coordinator._step_data["entity_map"]["sensor.temperature"]["in_statistics_meta"] is True
        assert coordinator._step_data["entity_map"]["sensor.temperature"]["metadata_id"] == 1

    def test_fetch_step_4_statistics_short_term(
        self, mock_hass: MagicMock, mock_config_entry: MagicMock, populated_sqlite_engine: Engine
    ):
        """Test step 4 fetches short-term statistics."""
        coordinator = StatisticsOrphanCoordinator(mock_hass, mock_config_entry)
        coordinator.db_service._engine = populated_sqlite_engine

        coordinator._init_step_data()
        result = coordinator._fetch_step_4_statistics_short_term()

        assert result["status"] == "complete"
        assert coordinator._step_data["entity_map"]["sensor.temperature"]["in_statistics_short_term"] is True
        assert coordinator._step_data["entity_map"]["sensor.temperature"]["stats_short_count"] > 0

    def test_fetch_step_5_statistics_long_term(
        self, mock_hass: MagicMock, mock_config_entry: MagicMock, populated_sqlite_engine: Engine
    ):
        """Test step 5 fetches long-term statistics."""
        coordinator = StatisticsOrphanCoordinator(mock_hass, mock_config_entry)
        coordinator.db_service._engine = populated_sqlite_engine

        coordinator._init_step_data()
        result = coordinator._fetch_step_5_statistics_long_term()

        assert result["status"] == "complete"
        assert coordinator._step_data["entity_map"]["sensor.temperature"]["in_statistics_long_term"] is True
        assert coordinator._step_data["entity_map"]["sensor.temperature"]["stats_long_count"] > 0

    def test_fetch_step_6_enrich_with_registry(
        self,
        mock_hass: MagicMock,
        mock_config_entry: MagicMock,
        mock_entity_registry: MagicMock,
        mock_device_registry: MagicMock,
        populated_sqlite_engine: Engine,
    ):
        """Test step 6 enriches with registry data."""
        coordinator = StatisticsOrphanCoordinator(mock_hass, mock_config_entry)
        coordinator.db_service._engine = populated_sqlite_engine

        # Mock registries
        with patch("custom_components.statistics_orphan_finder.coordinator.er.async_get") as mock_er:
            with patch("custom_components.statistics_orphan_finder.coordinator.dr.async_get") as mock_dr:
                mock_er.return_value = mock_entity_registry
                mock_dr.return_value = mock_device_registry

                # Initialize and run previous steps
                coordinator._init_step_data()
                coordinator._fetch_step_1_states_meta()
                coordinator._fetch_step_2_states()
                coordinator._fetch_step_3_statistics_meta()

                # Run step 6
                result = coordinator._fetch_step_6_enrich_with_registry()

                assert result["status"] == "complete"
                assert result["total_entities"] > 0
                assert "entities_list" in coordinator._step_data

                # Check entity structure
                entities = coordinator._step_data["entities_list"]
                assert len(entities) > 0
                first_entity = entities[0]
                assert "entity_id" in first_entity
                assert "in_entity_registry" in first_entity
                assert "registry_status" in first_entity

    def test_fetch_step_8_finalize(
        self,
        mock_hass: MagicMock,
        mock_config_entry: MagicMock,
        mock_entity_registry: MagicMock,
        mock_device_registry: MagicMock,
        populated_sqlite_engine: Engine,
    ):
        """Test step 8 finalizes and generates summary."""
        coordinator = StatisticsOrphanCoordinator(mock_hass, mock_config_entry)
        coordinator.db_service._engine = populated_sqlite_engine

        with patch("custom_components.statistics_orphan_finder.coordinator.er.async_get") as mock_er:
            with patch("custom_components.statistics_orphan_finder.coordinator.dr.async_get") as mock_dr:
                mock_er.return_value = mock_entity_registry
                mock_dr.return_value = mock_device_registry

                # Run all steps
                coordinator._init_step_data()
                coordinator._fetch_step_1_states_meta()
                coordinator._fetch_step_2_states()
                coordinator._fetch_step_3_statistics_meta()
                coordinator._fetch_step_4_statistics_short_term()
                coordinator._fetch_step_5_statistics_long_term()
                coordinator._fetch_step_6_enrich_with_registry()
                coordinator._fetch_step_7_calculate_deleted_storage()

                result = coordinator._fetch_step_8_finalize()

                # Check result structure
                assert "entities" in result
                assert "summary" in result

                # Check summary fields
                summary = result["summary"]
                assert "total_entities" in summary
                assert "in_entity_registry" in summary
                assert "deleted_storage_bytes" in summary
                assert "disabled_storage_bytes" in summary

                # Check cleanup
                assert coordinator._step_data is None

    @pytest.mark.asyncio
    async def test_async_execute_overview_step(
        self, mock_hass: MagicMock, mock_config_entry: MagicMock
    ):
        """Test async_execute_overview_step wrapper."""
        coordinator = StatisticsOrphanCoordinator(mock_hass, mock_config_entry)

        # Mock _execute_overview_step
        with patch.object(coordinator, "_execute_overview_step") as mock_execute:
            mock_execute.return_value = {"status": "complete"}

            result = await coordinator.async_execute_overview_step(1)

            assert result["status"] == "complete"
            mock_execute.assert_called_once_with(1)
            # Verify it used async_add_executor_job
            mock_hass.async_add_executor_job.assert_called_once()

    def test_execute_overview_step_invalid_step(
        self, mock_hass: MagicMock, mock_config_entry: MagicMock
    ):
        """Test _execute_overview_step with invalid step number."""
        coordinator = StatisticsOrphanCoordinator(mock_hass, mock_config_entry)

        with pytest.raises(ValueError, match="Invalid step"):
            coordinator._execute_overview_step(99)

    @pytest.mark.asyncio
    async def test_async_execute_overview_step_error_handling(
        self, mock_hass: MagicMock, mock_config_entry: MagicMock
    ):
        """Test error handling in async_execute_overview_step."""
        coordinator = StatisticsOrphanCoordinator(mock_hass, mock_config_entry)

        # Make async_add_executor_job raise an exception
        mock_hass.async_add_executor_job = AsyncMock(
            side_effect=Exception("Database error")
        )

        with pytest.raises(Exception, match="Database error"):
            await coordinator.async_execute_overview_step(1)


class TestCoordinatorServiceDelegation:
    """Test coordinator delegates to service modules."""

    def test_calculate_entity_storage_delegation(
        self, mock_hass: MagicMock, mock_config_entry: MagicMock
    ):
        """Test _calculate_entity_storage delegates to storage_calculator."""
        coordinator = StatisticsOrphanCoordinator(mock_hass, mock_config_entry)

        with patch.object(coordinator.storage_calculator, "calculate_entity_storage") as mock_calc:
            mock_calc.return_value = 5000

            result = coordinator._calculate_entity_storage(
                entity_id="sensor.test",
                origin="States",
                in_states_meta=True,
                in_statistics_meta=False,
            )

            assert result == 5000
            mock_calc.assert_called_once()

    def test_generate_delete_sql_delegation(
        self, mock_hass: MagicMock, mock_config_entry: MagicMock
    ):
        """Test generate_delete_sql delegates to sql_generator."""
        coordinator = StatisticsOrphanCoordinator(mock_hass, mock_config_entry)

        with patch.object(coordinator.sql_generator, "generate_delete_sql") as mock_gen:
            mock_gen.return_value = "DELETE FROM states WHERE..."

            result = coordinator.generate_delete_sql(
                entity_id="sensor.test",
                origin="States",
                in_states_meta=True,
                in_statistics_meta=False,
            )

            assert result == "DELETE FROM states WHERE..."
            mock_gen.assert_called_once()

    @pytest.mark.asyncio
    async def test_async_shutdown(
        self, mock_hass: MagicMock, mock_config_entry: MagicMock
    ):
        """Test async_shutdown cleans up resources."""
        coordinator = StatisticsOrphanCoordinator(mock_hass, mock_config_entry)

        with patch.object(coordinator.db_service, "close") as mock_close:
            await coordinator.async_shutdown()

            # Should call close via executor
            mock_hass.async_add_executor_job.assert_called()
            assert coordinator._step_data is None


class TestCoordinatorIntegration:
    """Integration tests for full coordinator workflow."""

    @pytest.mark.asyncio
    async def test_full_step_workflow(
        self,
        mock_hass: MagicMock,
        mock_config_entry: MagicMock,
        mock_entity_registry: MagicMock,
        mock_device_registry: MagicMock,
        populated_sqlite_engine: Engine,
    ):
        """Test executing all steps in sequence."""
        coordinator = StatisticsOrphanCoordinator(mock_hass, mock_config_entry)
        coordinator.db_service._engine = populated_sqlite_engine

        with patch("custom_components.statistics_orphan_finder.coordinator.er.async_get") as mock_er:
            with patch("custom_components.statistics_orphan_finder.coordinator.dr.async_get") as mock_dr:
                mock_er.return_value = mock_entity_registry
                mock_dr.return_value = mock_device_registry

                # Execute all steps
                for step in range(9):
                    result = await coordinator.async_execute_overview_step(step)

                    if step == 0:
                        assert result["status"] == "initialized"
                    elif step == 8:
                        assert "entities" in result
                        assert "summary" in result
                    else:
                        assert result["status"] == "complete"
