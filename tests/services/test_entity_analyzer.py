"""Tests for EntityAnalyzer."""
from __future__ import annotations

from datetime import datetime, timedelta, timezone
from unittest.mock import MagicMock

import pytest
from sqlalchemy import text
from sqlalchemy.engine import Engine

from custom_components.statistics_orphan_finder.services.entity_analyzer import (
    EntityAnalyzer,
)


class TestEntityAnalyzerAvailability:
    """Test EntityAnalyzer availability determination."""

    def test_determine_availability_disabled_by_user(
        self, mock_hass: MagicMock, mock_device_registry: MagicMock
    ):
        """Test entity disabled by user."""
        registry_entry = MagicMock()
        registry_entry.disabled = True
        registry_entry.disabled_by = "user"

        reason = EntityAnalyzer.determine_availability_reason(
            mock_hass, "sensor.test", registry_entry, None, mock_device_registry
        )

        assert reason == "Manually disabled by user"

    def test_determine_availability_disabled_by_integration(
        self, mock_hass: MagicMock, mock_device_registry: MagicMock
    ):
        """Test entity disabled by integration."""
        registry_entry = MagicMock()
        registry_entry.disabled = True
        registry_entry.disabled_by = "integration"

        reason = EntityAnalyzer.determine_availability_reason(
            mock_hass, "sensor.test", registry_entry, None, mock_device_registry
        )

        assert reason == "Disabled by integration"

    def test_determine_availability_device_disabled(
        self, mock_hass: MagicMock, mock_device_registry: MagicMock
    ):
        """Test entity with disabled device."""
        registry_entry = MagicMock()
        registry_entry.disabled = False
        registry_entry.device_id = "device_123"

        device_entry = MagicMock()
        device_entry.disabled = True
        device_entry.name = "Test Device"

        mock_device_registry.async_get = MagicMock(return_value=device_entry)

        reason = EntityAnalyzer.determine_availability_reason(
            mock_hass, "sensor.test", registry_entry, None, mock_device_registry
        )

        assert "Test Device" in reason
        assert "disabled" in reason

    def test_determine_availability_integration_setup_error(
        self, mock_hass: MagicMock, mock_device_registry: MagicMock
    ):
        """Test entity with failed integration setup."""
        registry_entry = MagicMock()
        registry_entry.disabled = False
        registry_entry.device_id = None
        registry_entry.config_entry_id = "config_123"
        registry_entry.platform = "mqtt"

        config_entry = MagicMock()
        config_entry.state.name = "SETUP_ERROR"

        mock_hass.config_entries.async_get_entry = MagicMock(return_value=config_entry)

        reason = EntityAnalyzer.determine_availability_reason(
            mock_hass, "sensor.test", registry_entry, None, mock_device_registry
        )

        assert "failed to load" in reason
        assert "mqtt" in reason

    def test_determine_availability_recently_unavailable(
        self, mock_hass: MagicMock, mock_device_registry: MagicMock
    ):
        """Test entity recently unavailable."""
        registry_entry = MagicMock()
        registry_entry.disabled = False
        registry_entry.device_id = None
        registry_entry.config_entry_id = None

        state = MagicMock()
        state.state = "unavailable"
        state.last_changed = datetime.now(timezone.utc) - timedelta(seconds=60)

        reason = EntityAnalyzer.determine_availability_reason(
            mock_hass, "sensor.test", registry_entry, state, mock_device_registry
        )

        assert "Recently unavailable" in reason
        assert "may still be loading" in reason

    def test_determine_availability_offline_hours(
        self, mock_hass: MagicMock, mock_device_registry: MagicMock
    ):
        """Test entity offline for hours."""
        registry_entry = MagicMock()
        registry_entry.disabled = False
        registry_entry.device_id = None
        registry_entry.config_entry_id = None

        state = MagicMock()
        state.state = "unavailable"
        state.last_changed = datetime.now(timezone.utc) - timedelta(hours=5)

        reason = EntityAnalyzer.determine_availability_reason(
            mock_hass, "sensor.test", registry_entry, state, mock_device_registry
        )

        assert "Offline for 5 hours" in reason

    def test_determine_availability_offline_days(
        self, mock_hass: MagicMock, mock_device_registry: MagicMock
    ):
        """Test entity offline for days."""
        registry_entry = MagicMock()
        registry_entry.disabled = False
        registry_entry.device_id = None
        registry_entry.config_entry_id = None

        state = MagicMock()
        state.state = "unavailable"
        state.last_changed = datetime.now(timezone.utc) - timedelta(days=3)

        reason = EntityAnalyzer.determine_availability_reason(
            mock_hass, "sensor.test", registry_entry, state, mock_device_registry
        )

        assert "Offline for 3 days" in reason

    def test_determine_availability_deleted_entity(
        self, mock_hass: MagicMock, mock_device_registry: MagicMock
    ):
        """Test deleted entity."""
        reason = EntityAnalyzer.determine_availability_reason(
            mock_hass, "sensor.test", None, None, mock_device_registry
        )

        assert "deleted" in reason.lower()

    def test_determine_availability_registered_but_never_loaded(
        self, mock_hass: MagicMock, mock_device_registry: MagicMock
    ):
        """Test entity registered but never loaded."""
        registry_entry = MagicMock()
        registry_entry.disabled = False
        registry_entry.device_id = None
        registry_entry.config_entry_id = None

        reason = EntityAnalyzer.determine_availability_reason(
            mock_hass, "sensor.test", registry_entry, None, mock_device_registry
        )

        assert "never loaded" in reason

    def test_determine_availability_available_entity(
        self, mock_hass: MagicMock, mock_device_registry: MagicMock
    ):
        """Test available entity returns None."""
        registry_entry = MagicMock()
        registry_entry.disabled = False
        registry_entry.device_id = None
        registry_entry.config_entry_id = None

        state = MagicMock()
        state.state = "20.5"  # Valid state, not unavailable/unknown
        state.last_changed = datetime.now(timezone.utc)

        reason = EntityAnalyzer.determine_availability_reason(
            mock_hass, "sensor.test", registry_entry, state, mock_device_registry
        )

        assert reason is None


class TestEntityAnalyzerStatisticsEligibility:
    """Test EntityAnalyzer statistics eligibility determination."""

    def test_determine_eligibility_deleted_entity(self):
        """Test deleted entity."""
        reason = EntityAnalyzer.determine_statistics_eligibility(
            "sensor.test", None, None
        )

        assert "deleted" in reason.lower()

    def test_determine_eligibility_disabled_entity(self):
        """Test disabled entity."""
        registry_entry = MagicMock()
        registry_entry.disabled = True

        reason = EntityAnalyzer.determine_statistics_eligibility(
            "sensor.test", registry_entry, None
        )

        assert "disabled" in reason.lower()

    def test_determine_eligibility_no_state(self):
        """Test entity with no state."""
        registry_entry = MagicMock()
        registry_entry.disabled = False

        reason = EntityAnalyzer.determine_statistics_eligibility(
            "sensor.test", registry_entry, None
        )

        assert "no state" in reason.lower()

    def test_determine_eligibility_unavailable_state(self):
        """Test entity with unavailable state."""
        registry_entry = MagicMock()
        registry_entry.disabled = False

        state = MagicMock()
        state.state = "unavailable"
        state.attributes = {}

        reason = EntityAnalyzer.determine_statistics_eligibility(
            "sensor.test", registry_entry, state
        )

        assert "unavailable" in reason.lower()

    @pytest.mark.parametrize("domain,expected_text", [
        ("binary_sensor", "Binary sensors"),
        ("switch", "Switches"),
        ("light", "Lights"),
        ("button", "Buttons"),
        ("automation", "Automations"),
    ])
    def test_determine_eligibility_incompatible_domain(
        self, domain: str, expected_text: str
    ):
        """Test incompatible domain detection."""
        registry_entry = MagicMock()
        registry_entry.disabled = False

        state = MagicMock()
        state.state = "on"
        state.attributes = {}

        reason = EntityAnalyzer.determine_statistics_eligibility(
            f"{domain}.test", registry_entry, state
        )

        assert expected_text in reason

    def test_determine_eligibility_non_numeric_state(self):
        """Test entity with non-numeric state."""
        registry_entry = MagicMock()
        registry_entry.disabled = False

        state = MagicMock()
        state.state = "idle"
        state.attributes = {}

        reason = EntityAnalyzer.determine_statistics_eligibility(
            "sensor.test", registry_entry, state
        )

        assert "not numeric" in reason

    def test_determine_eligibility_missing_state_class(self):
        """Test entity missing state_class attribute."""
        registry_entry = MagicMock()
        registry_entry.disabled = False

        state = MagicMock()
        state.state = "20.5"
        state.attributes = {}

        reason = EntityAnalyzer.determine_statistics_eligibility(
            "sensor.test", registry_entry, state
        )

        assert "state_class" in reason

    def test_determine_eligibility_missing_unit(self):
        """Test entity missing unit_of_measurement."""
        registry_entry = MagicMock()
        registry_entry.disabled = False

        state = MagicMock()
        state.state = "20.5"
        state.attributes = {"state_class": "measurement"}

        reason = EntityAnalyzer.determine_statistics_eligibility(
            "sensor.test", registry_entry, state
        )

        assert "unit_of_measurement" in reason

    def test_determine_eligibility_valid_entity(self):
        """Test valid entity eligible for statistics."""
        registry_entry = MagicMock()
        registry_entry.disabled = False

        state = MagicMock()
        state.state = "20.5"
        state.attributes = {
            "state_class": "measurement",
            "unit_of_measurement": "°C",
        }

        reason = EntityAnalyzer.determine_statistics_eligibility(
            "sensor.test", registry_entry, state
        )

        assert "eligible" in reason.lower()


class TestEntityAnalyzerUpdateFrequency:
    """Test EntityAnalyzer update frequency calculation."""

    def test_calculate_update_frequency(self, populated_sqlite_engine: Engine):
        """Test calculating update frequency with sufficient data."""
        result = EntityAnalyzer.calculate_update_frequency(
            populated_sqlite_engine, "sensor.temperature"
        )

        assert result is not None
        assert "interval_seconds" in result
        assert "update_count_24h" in result
        assert "interval_text" in result
        assert result["interval_seconds"] > 0

    def test_calculate_update_frequency_insufficient_data(
        self, populated_sqlite_engine: Engine
    ):
        """Test calculating frequency with insufficient data."""
        # Add entity with only 1 state
        with populated_sqlite_engine.connect() as conn:
            conn.execute(text("""
                INSERT INTO states_meta (entity_id) VALUES ('sensor.single_state')
            """))
            conn.execute(text("""
                INSERT INTO states (metadata_id, state, last_updated_ts)
                SELECT metadata_id, '10', 1234567890
                FROM states_meta WHERE entity_id = 'sensor.single_state'
            """))
            conn.commit()

        result = EntityAnalyzer.calculate_update_frequency(
            populated_sqlite_engine, "sensor.single_state"
        )

        assert result is None

    def test_calculate_update_frequency_nonexistent_entity(
        self, populated_sqlite_engine: Engine
    ):
        """Test calculating frequency for non-existent entity."""
        result = EntityAnalyzer.calculate_update_frequency(
            populated_sqlite_engine, "sensor.nonexistent"
        )

        assert result is None

    def test_calculate_update_frequency_24h_average(
        self, populated_sqlite_engine: Engine
    ):
        """Test that frequency calculation uses 24-hour average, not last N messages."""
        from datetime import datetime, timezone

        # Create entity with burst activity pattern:
        # 10 messages in last hour (frequent), then idle for 23 hours
        now = datetime.now(timezone.utc).timestamp()

        with populated_sqlite_engine.connect() as conn:
            conn.execute(text("""
                INSERT INTO states_meta (entity_id) VALUES ('sensor.burst_activity')
            """))

            # Insert 10 states in the last hour (every 6 minutes)
            for i in range(10):
                timestamp = now - (i * 360)  # 360 seconds = 6 minutes apart
                conn.execute(text("""
                    INSERT INTO states (metadata_id, state, last_updated_ts)
                    SELECT metadata_id, '1', :ts
                    FROM states_meta WHERE entity_id = 'sensor.burst_activity'
                """), {"ts": timestamp})

            conn.commit()

        result = EntityAnalyzer.calculate_update_frequency(
            populated_sqlite_engine, "sensor.burst_activity"
        )

        assert result is not None
        # With 10 messages in 24h: 86400 / 10 = 8640 seconds = 2.4 hours
        # Should be around 8640 seconds (allowing for small timing variations)
        assert result["interval_seconds"] >= 8600
        assert result["interval_seconds"] <= 8700
        assert result["update_count_24h"] == 10
        # Should format as hours, not seconds (shows true average, not burst interval)
        assert "h" in result["interval_text"]

    def test_format_interval_seconds(self):
        """Test formatting intervals in seconds."""
        assert EntityAnalyzer.format_interval(30) == "30s"
        assert EntityAnalyzer.format_interval(45) == "45s"

    def test_format_interval_minutes(self):
        """Test formatting intervals in minutes."""
        assert EntityAnalyzer.format_interval(120) == "2.00min"
        assert EntityAnalyzer.format_interval(600) == "10.0min"
        assert EntityAnalyzer.format_interval(900) == "15.0min"

    def test_format_interval_hours(self):
        """Test formatting intervals in hours."""
        assert EntityAnalyzer.format_interval(3600) == "1.00h"
        assert EntityAnalyzer.format_interval(7200) == "2.00h"
        assert EntityAnalyzer.format_interval(36000) == "10.0h"

    def test_format_interval_none(self):
        """Test formatting None interval."""
        assert EntityAnalyzer.format_interval(None) is None

    def test_format_interval_zero(self):
        """Test formatting zero interval."""
        assert EntityAnalyzer.format_interval(0) is None


class TestHourlyMessageCounts:
    """Tests for hourly message histogram bucketing."""

    def _prepare_entity(self, engine: Engine, entity_id: str) -> tuple[float, float]:
        """Reset tables and return cutoff/end timestamps for convenience."""
        now = datetime.now(timezone.utc)
        current_hour_start = now.replace(minute=0, second=0, microsecond=0)
        with engine.connect() as conn:
            conn.execute(text("DELETE FROM states"))
            conn.execute(text("DELETE FROM states_meta"))
            conn.execute(
                text("INSERT INTO states_meta (metadata_id, entity_id) VALUES (1, :entity)"),
                {"entity": entity_id},
            )
            conn.commit()
        return (current_hour_start - timedelta(hours=6)).timestamp(), current_hour_start.timestamp()

    def test_get_hourly_message_counts_aligned_buckets(self, sqlite_engine: Engine):
        """Bucket ordering uses oldest hour at index 0 and newest at index N-1."""
        cutoff_ts, end_cutoff = self._prepare_entity(sqlite_engine, "sensor.histogram")
        cutoff_dt = datetime.fromtimestamp(cutoff_ts, tz=timezone.utc)

        with sqlite_engine.connect() as conn:
            # Oldest bucket (index 0)
            conn.execute(
                text(
                    "INSERT INTO states (metadata_id, state, last_updated_ts) "
                    "VALUES (1, '1', :ts)"
                ),
                {"ts": (cutoff_dt + timedelta(minutes=1)).timestamp()},
            )
            # Middle bucket (index 3)
            conn.execute(
                text(
                    "INSERT INTO states (metadata_id, state, last_updated_ts) "
                    "VALUES (1, '1', :ts)"
                ),
                {"ts": (cutoff_dt + timedelta(hours=3, minutes=10)).timestamp()},
            )
            # Newest bucket (index 5)
            conn.execute(
                text(
                    "INSERT INTO states (metadata_id, state, last_updated_ts) "
                    "VALUES (1, '1', :ts)"
                ),
                {"ts": end_cutoff - 600},  # 10 minutes before end cutoff
            )
            conn.commit()

        result = EntityAnalyzer.get_hourly_message_counts(sqlite_engine, "sensor.histogram", 6)

        assert result["hourly_counts"] == [1, 0, 0, 1, 0, 1]
        assert result["total_messages"] == 3
        assert result["time_range_hours"] == 6

    def test_get_hourly_message_counts_boundary_conditions(self, sqlite_engine: Engine):
        """Messages on cutoff boundary are included; end boundary is excluded."""
        cutoff_ts, end_cutoff = self._prepare_entity(sqlite_engine, "sensor.boundary")

        with sqlite_engine.connect() as conn:
            # Exactly at cutoff -> should be in bucket 0
            conn.execute(
                text(
                    "INSERT INTO states (metadata_id, state, last_updated_ts) "
                    "VALUES (1, '1', :ts)"
                ),
                {"ts": cutoff_ts},
            )
            # Exactly at end cutoff -> should be excluded by '< end_cutoff'
            conn.execute(
                text(
                    "INSERT INTO states (metadata_id, state, last_updated_ts) "
                    "VALUES (1, '1', :ts)"
                ),
                {"ts": end_cutoff},
            )
            conn.commit()

        result = EntityAnalyzer.get_hourly_message_counts(sqlite_engine, "sensor.boundary", 6)

        assert result["hourly_counts"][0] == 1
        assert sum(result["hourly_counts"]) == 1
        assert result["time_range_hours"] == 6

    def test_get_hourly_message_counts_out_of_range(self, sqlite_engine: Engine):
        """Events outside the time window are ignored."""
        cutoff_ts, end_cutoff = self._prepare_entity(sqlite_engine, "sensor.outofrange")

        with sqlite_engine.connect() as conn:
            # Before cutoff
            conn.execute(
                text(
                    "INSERT INTO states (metadata_id, state, last_updated_ts) "
                    "VALUES (1, '1', :ts)"
                ),
                {"ts": cutoff_ts - 10},
            )
            # After end cutoff
            conn.execute(
                text(
                    "INSERT INTO states (metadata_id, state, last_updated_ts) "
                    "VALUES (1, '1', :ts)"
                ),
                {"ts": end_cutoff + 10},
            )
            conn.commit()

        result = EntityAnalyzer.get_hourly_message_counts(sqlite_engine, "sensor.outofrange", 6)

        assert all(count == 0 for count in result["hourly_counts"])
        assert result["total_messages"] == 0
        assert result["time_range_hours"] == 6
