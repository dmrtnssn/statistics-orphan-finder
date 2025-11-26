"""Pytest fixtures for Statistics Orphan Finder tests."""
from __future__ import annotations

from datetime import datetime, timezone
from typing import Any, Generator
from unittest.mock import AsyncMock, MagicMock, Mock, patch

import pytest
from sqlalchemy import create_engine, text
from sqlalchemy.engine import Engine

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers import entity_registry as er
from homeassistant.helpers import device_registry as dr

from custom_components.statistics_orphan_finder.const import (
    CONF_DB_URL,
    CONF_USERNAME,
    CONF_PASSWORD,
    DOMAIN,
)


@pytest.fixture
def mock_config_entry() -> ConfigEntry:
    """Create a mock config entry."""
    return MagicMock(
        spec=ConfigEntry,
        domain=DOMAIN,
        data={
            CONF_DB_URL: "sqlite:///:memory:",
            CONF_USERNAME: None,
            CONF_PASSWORD: None,
        },
        entry_id="test_entry_id",
        title="Test Statistics Orphan Finder",
    )


@pytest.fixture
def sqlite_engine() -> Generator[Engine, None, None]:
    """Create an in-memory SQLite engine with test schema."""
    engine = create_engine("sqlite:///:memory:")

    # Create Home Assistant recorder schema (simplified)
    with engine.connect() as conn:
        conn.execute(text("""
            CREATE TABLE states_meta (
                metadata_id INTEGER PRIMARY KEY AUTOINCREMENT,
                entity_id VARCHAR(255) NOT NULL UNIQUE
            )
        """))

        conn.execute(text("""
            CREATE TABLE states (
                state_id INTEGER PRIMARY KEY AUTOINCREMENT,
                metadata_id INTEGER,
                state VARCHAR(255),
                last_updated_ts REAL,
                old_state_id INTEGER,
                FOREIGN KEY (metadata_id) REFERENCES states_meta(metadata_id),
                FOREIGN KEY (old_state_id) REFERENCES states(state_id)
            )
        """))

        conn.execute(text("""
            CREATE TABLE statistics_meta (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                statistic_id VARCHAR(255) NOT NULL UNIQUE,
                source VARCHAR(255),
                unit_of_measurement VARCHAR(255),
                has_mean BOOLEAN,
                has_sum BOOLEAN
            )
        """))

        conn.execute(text("""
            CREATE TABLE statistics (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                metadata_id INTEGER,
                start_ts REAL NOT NULL,
                mean REAL,
                min REAL,
                max REAL,
                sum REAL,
                state REAL,
                FOREIGN KEY (metadata_id) REFERENCES statistics_meta(id)
            )
        """))

        conn.execute(text("""
            CREATE TABLE statistics_short_term (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                metadata_id INTEGER,
                start_ts REAL NOT NULL,
                mean REAL,
                min REAL,
                max REAL,
                sum REAL,
                state REAL,
                FOREIGN KEY (metadata_id) REFERENCES statistics_meta(id)
            )
        """))

        conn.commit()

    yield engine

    engine.dispose()


@pytest.fixture
def populated_sqlite_engine(sqlite_engine: Engine) -> Engine:
    """Create a populated SQLite engine with test data."""
    with sqlite_engine.connect() as conn:
        # Add states_meta entries
        conn.execute(text("""
            INSERT INTO states_meta (metadata_id, entity_id)
            VALUES
                (1, 'sensor.temperature'),
                (2, 'sensor.humidity'),
                (3, 'sensor.deleted_entity'),
                (4, 'switch.test_switch')
        """))

        # Add states entries
        now = datetime.now(timezone.utc).timestamp()
        conn.execute(text("""
            INSERT INTO states (state_id, metadata_id, state, last_updated_ts)
            VALUES
                (1, 1, '20.5', :ts1),
                (2, 1, '21.0', :ts2),
                (3, 2, '45.2', :ts3),
                (4, 3, '10.0', :ts4)
        """), {"ts1": now - 3600, "ts2": now - 1800, "ts3": now - 900, "ts4": now - 86400})

        # Add statistics_meta entries
        conn.execute(text("""
            INSERT INTO statistics_meta (id, statistic_id, source, unit_of_measurement, has_mean, has_sum)
            VALUES
                (1, 'sensor.temperature', 'recorder', '°C', 1, 0),
                (2, 'sensor.humidity', 'recorder', '%', 1, 0),
                (3, 'sensor.deleted_stats', 'recorder', 'W', 1, 1)
        """))

        # Add statistics entries (long-term)
        conn.execute(text("""
            INSERT INTO statistics (metadata_id, start_ts, mean, min, max, state)
            VALUES
                (1, :ts1, 20.5, 18.0, 23.0, 20.5),
                (1, :ts2, 21.0, 19.0, 24.0, 21.0),
                (2, :ts3, 45.2, 40.0, 50.0, 45.2)
        """), {"ts1": now - 7200, "ts2": now - 3600, "ts3": now - 1800})

        # Add statistics_short_term entries
        conn.execute(text("""
            INSERT INTO statistics_short_term (metadata_id, start_ts, mean, min, max, state)
            VALUES
                (1, :ts1, 20.5, 18.0, 23.0, 20.5),
                (2, :ts2, 45.2, 40.0, 50.0, 45.2),
                (3, :ts3, 100.0, 90.0, 110.0, 100.0)
        """), {"ts1": now - 600, "ts2": now - 300, "ts3": now - 900})

        conn.commit()

    return sqlite_engine


@pytest.fixture
def mock_hass() -> MagicMock:
    """Create a mock Home Assistant instance."""
    hass = MagicMock(spec=HomeAssistant)

    # Mock async_add_executor_job to run sync functions directly
    async def async_add_executor_job(func, *args):
        return func(*args)

    hass.async_add_executor_job = AsyncMock(side_effect=async_add_executor_job)

    # Mock config_entries
    hass.config_entries = MagicMock()
    hass.config_entries.async_get_entry = MagicMock(return_value=None)

    # Mock states
    hass.states = MagicMock()
    hass.states.get = MagicMock(return_value=None)

    return hass


@pytest.fixture
def mock_entity_registry() -> MagicMock:
    """Create a mock entity registry."""
    registry = MagicMock(spec=er.EntityRegistry)

    # Create some test entity entries
    enabled_entry = MagicMock()
    enabled_entry.entity_id = "sensor.temperature"
    enabled_entry.disabled = False
    enabled_entry.disabled_by = None
    enabled_entry.platform = "homeassistant"
    enabled_entry.device_id = None
    enabled_entry.config_entry_id = None

    disabled_entry = MagicMock()
    disabled_entry.entity_id = "sensor.humidity"
    disabled_entry.disabled = True
    disabled_entry.disabled_by = "user"
    disabled_entry.platform = "homeassistant"
    disabled_entry.device_id = None
    disabled_entry.config_entry_id = None

    def async_get(entity_id: str):
        if entity_id == "sensor.temperature":
            return enabled_entry
        elif entity_id == "sensor.humidity":
            return disabled_entry
        return None

    registry.async_get = MagicMock(side_effect=async_get)

    return registry


@pytest.fixture
def mock_device_registry() -> MagicMock:
    """Create a mock device registry."""
    registry = MagicMock(spec=dr.DeviceRegistry)
    registry.async_get = MagicMock(return_value=None)
    return registry


@pytest.fixture
def mock_state() -> MagicMock:
    """Create a mock state object."""
    state = MagicMock()
    state.entity_id = "sensor.temperature"
    state.state = "20.5"
    state.last_changed = datetime.now(timezone.utc)
    state.last_updated = datetime.now(timezone.utc)
    state.attributes = {
        "unit_of_measurement": "°C",
        "state_class": "measurement",
        "friendly_name": "Temperature",
    }
    return state


# Database parametrization fixture
@pytest.fixture(params=["sqlite"])
def db_engine(request, sqlite_engine: Engine) -> Engine:
    """Parametrized fixture for different database types."""
    if request.param == "sqlite":
        return sqlite_engine
    # Add MySQL/PostgreSQL here when using testcontainers
    raise ValueError(f"Unsupported database type: {request.param}")


class MockResult:
    """Simple iterator-compatible result wrapper."""

    def __init__(self, rows: list[tuple[Any, ...]]):
        self._rows = list(rows)
        self._index = 0

    def fetchone(self):
        if self._index < len(self._rows):
            row = self._rows[self._index]
            self._index += 1
            return row
        return None

    def __iter__(self):
        return iter(self._rows)


@pytest.fixture
def mock_mysql_connection(sqlite_engine: Engine) -> MagicMock:
    """Mock MySQL connection that intercepts information_schema queries."""
    with sqlite_engine.connect() as conn:
        conn.execute(text("DELETE FROM states"))
        conn.execute(text("DELETE FROM states_meta"))
        conn.execute(text("DELETE FROM statistics_meta"))
        conn.execute(text("DELETE FROM statistics"))
        conn.execute(text("DELETE FROM statistics_short_term"))
        conn.execute(text("INSERT INTO states_meta (metadata_id, entity_id) VALUES (1, 'sensor.sample')"))
        conn.execute(text("INSERT INTO states (metadata_id, state, last_updated_ts) VALUES (1, '1', 1.0)"))
        conn.execute(text("INSERT INTO statistics_meta (id, statistic_id, source, unit_of_measurement, has_mean, has_sum) VALUES (1, 'sensor.sample', 'recorder', 'u', 1, 0)"))
        conn.execute(text("INSERT INTO statistics (metadata_id, start_ts, mean) VALUES (1, 1.0, 1.0)"))
        conn.execute(text("INSERT INTO statistics_short_term (metadata_id, start_ts, mean) VALUES (1, 1.0, 1.0)"))
        conn.commit()

    def mock_execute(query, params=None):
        query_str = str(query)
        if "information_schema.tables" in query_str:
            if "states" in query_str:
                return MockResult([(150,)])
            if "statistics_short_term" in query_str:
                return MockResult([(120,)])
            return MockResult([(100,)])

        # Fallback to SQLite execution for other queries
        with sqlite_engine.connect() as conn:
            result = conn.execute(query, params or {})
            rows = result.fetchall()
            return MockResult(rows)

    mock_conn = MagicMock()
    mock_conn.execute = MagicMock(side_effect=mock_execute)
    return mock_conn


@pytest.fixture
def mock_postgres_connection(sqlite_engine: Engine) -> MagicMock:
    """Mock PostgreSQL connection that intercepts pg_total_relation_size queries."""
    with sqlite_engine.connect() as conn:
        conn.execute(text("DELETE FROM states"))
        conn.execute(text("DELETE FROM states_meta"))
        conn.execute(text("DELETE FROM statistics_meta"))
        conn.execute(text("DELETE FROM statistics"))
        conn.execute(text("DELETE FROM statistics_short_term"))
        conn.execute(text("INSERT INTO states_meta (metadata_id, entity_id) VALUES (1, 'sensor.sample')"))
        conn.execute(text("INSERT INTO states (metadata_id, state, last_updated_ts) VALUES (1, '1', 1.0)"))
        conn.execute(text("INSERT INTO statistics_meta (id, statistic_id, source, unit_of_measurement, has_mean, has_sum) VALUES (1, 'sensor.sample', 'recorder', 'u', 1, 0)"))
        conn.execute(text("INSERT INTO statistics (metadata_id, start_ts, mean) VALUES (1, 1.0, 1.0)"))
        conn.execute(text("INSERT INTO statistics_short_term (metadata_id, start_ts, mean) VALUES (1, 1.0, 1.0)"))
        conn.commit()

    def mock_execute(query, params=None):
        query_str = str(query)
        if "pg_total_relation_size" in query_str:
            if "statistics_short_term" in query_str:
                return MockResult([(3000000,)])  # 3MB
            if "statistics" in query_str:
                return MockResult([(4000000,)])  # 4MB
            return MockResult([(5000000,)])  # default

        # Fallback to SQLite execution for other queries
        with sqlite_engine.connect() as conn:
            result = conn.execute(query, params or {})
            rows = result.fetchall()
            return MockResult(rows)

    mock_conn = MagicMock()
    mock_conn.execute = MagicMock(side_effect=mock_execute)
    return mock_conn
