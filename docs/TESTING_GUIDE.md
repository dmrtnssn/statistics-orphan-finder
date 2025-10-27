# Testing Guide for Statistics Orphan Finder

This guide covers the comprehensive testing strategy for the Statistics Orphan Finder custom integration.

## Table of Contents

1. [Overview](#overview)
2. [Setup](#setup)
3. [Test Structure](#test-structure)
4. [Running Tests](#running-tests)
5. [Writing Tests](#writing-tests)
6. [Testing Patterns](#testing-patterns)
7. [Continuous Integration](#continuous-integration)

## Overview

The test suite uses **pytest** with the following features:

- **Async support** via `pytest-asyncio`
- **Coverage reporting** via `pytest-cov`
- **Mocking** via `pytest-mock` and `unittest.mock`
- **Home Assistant test utilities** via `pytest-homeassistant-custom-component`
- **In-memory SQLite databases** for fast, isolated tests

### Test Categories

- **Unit tests**: Test individual functions/methods in isolation
- **Integration tests**: Test service interactions and database operations
- **Coordinator tests**: Test the 8-step progressive data loading workflow

## Setup

### 1. Install Test Dependencies

```bash
pip install -r requirements_test.txt
```

This installs:
- pytest and plugins (asyncio, cov, timeout, mock)
- Home Assistant testing utilities
- SQLAlchemy for database testing
- Freezegun for time-based testing

### 2. Verify Installation

```bash
pytest --version
```

Expected output: `pytest 7.4.3` or higher

## Test Structure

```
tests/
├── conftest.py                    # Shared fixtures
├── test_coordinator.py            # Coordinator tests
├── services/
│   ├── test_database_service.py
│   ├── test_entity_analyzer.py
│   ├── test_storage_calculator.py
│   └── test_sql_generator.py
└── fixtures/
    └── database_fixtures.py       # Database setup helpers
```

### Key Fixtures (conftest.py)

- **`mock_config_entry`**: Mock Home Assistant config entry
- **`sqlite_engine`**: In-memory SQLite engine with HA schema
- **`populated_sqlite_engine`**: SQLite engine with test data
- **`mock_hass`**: Mock Home Assistant instance
- **`mock_entity_registry`**: Mock entity registry
- **`mock_device_registry`**: Mock device registry
- **`mock_state`**: Mock state object

## Running Tests

### Run All Tests

```bash
pytest
```

### Run Specific Test File

```bash
pytest tests/services/test_database_service.py
```

### Run Specific Test Class

```bash
pytest tests/services/test_database_service.py::TestDatabaseService
```

### Run Specific Test Method

```bash
pytest tests/services/test_database_service.py::TestDatabaseService::test_get_engine_creates_engine
```

### Run with Coverage

```bash
pytest --cov=custom_components.statistics_orphan_finder --cov-report=html
```

This generates an HTML coverage report in `htmlcov/index.html`.

### Run Only Fast Tests (Unit Tests)

```bash
pytest -m unit
```

### Run Only Integration Tests

```bash
pytest -m integration
```

### Run with Verbose Output

```bash
pytest -v
```

### Run with Debug Logging

```bash
pytest --log-cli-level=DEBUG
```

### Run in Parallel (requires pytest-xdist)

```bash
pip install pytest-xdist
pytest -n auto
```

## Writing Tests

### Test Class Naming Convention

```python
class TestClassName:
    """Test ClassName class."""

    def test_method_behavior(self):
        """Test method does something."""
        pass
```

### Async Test Example

```python
import pytest

class TestAsyncMethods:
    @pytest.mark.asyncio
    async def test_async_method(self, mock_hass):
        """Test async method."""
        result = await some_async_function(mock_hass)
        assert result is not None
```

### Using Fixtures

```python
def test_with_database(self, populated_sqlite_engine):
    """Test using populated database."""
    with populated_sqlite_engine.connect() as conn:
        result = conn.execute(text("SELECT COUNT(*) FROM states"))
        assert result.scalar() > 0
```

### Parametrized Tests

```python
@pytest.mark.parametrize("input,expected", [
    ("sqlite:///test.db", True),
    ("mysql://localhost/db", False),
    ("postgresql://localhost/db", False),
])
def test_database_detection(self, input, expected):
    """Test database type detection."""
    is_sqlite = input.startswith("sqlite")
    assert is_sqlite == expected
```

### Mocking Examples

#### Mock Method Return Value

```python
from unittest.mock import MagicMock, patch

def test_with_mock(self, mock_config_entry):
    """Test with mocked method."""
    with patch("module.function") as mock_func:
        mock_func.return_value = "mocked value"

        result = call_function()

        assert result == "mocked value"
        mock_func.assert_called_once()
```

#### Mock Async Method

```python
from unittest.mock import AsyncMock

def test_async_mock(self):
    """Test with async mock."""
    mock_service = MagicMock()
    mock_service.async_method = AsyncMock(return_value={"key": "value"})

    result = await mock_service.async_method()

    assert result["key"] == "value"
```

#### Mock Side Effects

```python
def test_with_side_effect(self):
    """Test mock with side effect."""
    mock_func = MagicMock(side_effect=Exception("Error"))

    with pytest.raises(Exception, match="Error"):
        mock_func()
```

## Testing Patterns

### Pattern 1: Testing Database Queries

```python
def test_database_query(self, populated_sqlite_engine):
    """Test database query returns correct results."""
    service = DatabaseService(mock_hass, mock_config_entry)
    service._engine = populated_sqlite_engine

    with service.get_engine().connect() as conn:
        query = text("SELECT entity_id FROM states_meta")
        result = conn.execute(query)
        entities = [row[0] for row in result]

    assert "sensor.temperature" in entities
```

### Pattern 2: Testing Async Coordinator Methods

```python
@pytest.mark.asyncio
async def test_coordinator_step(self, mock_hass, mock_config_entry, populated_sqlite_engine):
    """Test coordinator executes step correctly."""
    coordinator = StatisticsOrphanCoordinator(mock_hass, mock_config_entry)
    coordinator.db_service._engine = populated_sqlite_engine

    # Initialize
    await coordinator.async_execute_overview_step(0)

    # Execute step
    result = await coordinator.async_execute_overview_step(1)

    assert result["status"] == "complete"
    assert result["entities_found"] > 0
```

### Pattern 3: Testing Error Handling

```python
def test_error_handling(self, mock_config_entry):
    """Test function handles errors gracefully."""
    calculator = StorageCalculator(mock_config_entry)

    # Create engine that will fail
    bad_engine = create_engine("sqlite:///:memory:")
    with bad_engine.connect() as conn:
        conn.execute(text("DROP TABLE states"))
        conn.commit()

    # Should return 0, not raise exception
    result = calculator.calculate_entity_storage(
        bad_engine, "sensor.test", "States", True, False
    )

    assert result == 0
```

### Pattern 4: Testing Service Delegation

```python
def test_service_delegation(self, mock_hass, mock_config_entry):
    """Test coordinator delegates to service."""
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
```

### Pattern 5: Testing Multiple Database Types

```python
@pytest.mark.parametrize("db_url,expected_syntax", [
    ("sqlite:///test.db", "BEGIN;"),
    ("mysql://localhost/db", "START TRANSACTION;"),
    ("postgresql://localhost/db", "BEGIN;"),
])
def test_database_specific_sql(self, mock_config_entry, populated_sqlite_engine, db_url, expected_syntax):
    """Test SQL generation for different databases."""
    mock_config_entry.data["db_url"] = db_url
    generator = SqlGenerator(mock_config_entry)

    sql = generator.generate_delete_sql(
        populated_sqlite_engine, "sensor.test", "States", True, False
    )

    assert expected_syntax in sql
```

## Best Practices

### 1. Test Isolation

Each test should be independent and not rely on other tests:

```python
# Good
def test_something(self, populated_sqlite_engine):
    # Uses fresh fixture each time
    pass

# Bad
def test_something(self):
    # Uses shared global state
    pass
```

### 2. Descriptive Test Names

```python
# Good
def test_calculate_entity_storage_returns_zero_for_nonexistent_entity(self):
    pass

# Bad
def test_storage(self):
    pass
```

### 3. Arrange-Act-Assert Pattern

```python
def test_something(self):
    # Arrange
    service = DatabaseService(mock_hass, mock_config_entry)

    # Act
    result = service.get_engine()

    # Assert
    assert result is not None
```

### 4. Test One Thing Per Test

```python
# Good
def test_engine_creation(self):
    service = DatabaseService(mock_hass, mock_config_entry)
    engine = service.get_engine()
    assert engine is not None

def test_engine_reuse(self):
    service = DatabaseService(mock_hass, mock_config_entry)
    engine1 = service.get_engine()
    engine2 = service.get_engine()
    assert engine1 is engine2

# Bad
def test_engine(self):
    # Tests multiple behaviors
    pass
```

### 5. Use Fixtures for Common Setup

```python
# conftest.py
@pytest.fixture
def service(mock_hass, mock_config_entry):
    """Create DatabaseService instance."""
    return DatabaseService(mock_hass, mock_config_entry)

# test file
def test_something(self, service):
    # Use fixture directly
    result = service.get_engine()
    assert result is not None
```

## Coverage Goals

Target coverage levels:

- **Overall**: 85%+
- **Service modules**: 90%+
- **Coordinator**: 85%+
- **Critical paths** (SQL generation, storage calculation): 95%+

### View Coverage Report

```bash
pytest --cov=custom_components.statistics_orphan_finder --cov-report=html
open htmlcov/index.html  # macOS
xdg-open htmlcov/index.html  # Linux
```

### Coverage by Module

```bash
pytest --cov=custom_components.statistics_orphan_finder --cov-report=term-missing
```

## Continuous Integration

### GitHub Actions Example

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      - name: Install dependencies
        run: |
          pip install -r requirements_test.txt
      - name: Run tests
        run: |
          pytest --cov --cov-report=xml
      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

## Troubleshooting

### Issue: Async tests hanging

**Solution**: Ensure `pytest-asyncio` is installed and `asyncio_mode = auto` is set in `pytest.ini`.

### Issue: Database connection errors

**Solution**: Check that fixtures are creating fresh engines per test. Use `populated_sqlite_engine` fixture.

### Issue: Import errors

**Solution**: Ensure you're running pytest from the repository root:

```bash
cd <project-root>
pytest
```

### Issue: Slow tests

**Solution**:
- Use `pytest -n auto` for parallel execution
- Mark slow tests with `@pytest.mark.slow` and exclude them: `pytest -m "not slow"`

## Advanced Topics

### Testing with Docker Databases

For testing against real MySQL/PostgreSQL:

```python
# Requires testcontainers
from testcontainers.mysql import MySqlContainer

@pytest.fixture
def mysql_engine():
    with MySqlContainer("mysql:8.0") as mysql:
        engine = create_engine(mysql.get_connection_url())
        # Setup schema...
        yield engine
```

### Testing with Time Mocking

```python
from freezegun import freeze_time

@freeze_time("2024-01-01 12:00:00")
def test_time_dependent_logic(self):
    """Test with frozen time."""
    result = calculate_duration()
    assert result == expected_value
```

### Testing Long-Running Operations

```python
@pytest.mark.timeout(5)
def test_operation_completes_quickly(self):
    """Test operation completes within timeout."""
    result = long_operation()
    assert result is not None
```

## Resources

- [pytest documentation](https://docs.pytest.org/)
- [pytest-asyncio documentation](https://pytest-asyncio.readthedocs.io/)
- [Home Assistant testing guide](https://developers.home-assistant.io/docs/development_testing)
- [SQLAlchemy testing](https://docs.sqlalchemy.org/en/20/core/testing.html)

## Summary

This testing strategy provides:

1. **Comprehensive coverage** of all backend components
2. **Fast execution** using in-memory databases
3. **Isolated tests** with proper fixtures and mocking
4. **Clear patterns** for testing async code, database operations, and service delegation
5. **Maintainable structure** with organized test files and descriptive names

Run tests frequently during development to catch regressions early!
